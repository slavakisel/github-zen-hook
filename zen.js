var request = require('request');

/**
* Creates a comment to each new pull request with a random string of GitHub zen.
* Comment API reference: https://developer.github.com/v3/issues/comments/#get-a-single-comment
*
* INSTALLATION
* Add a webhook to your GitHub repository with application/json content type:
* https://wt-474e7289cddab09085e8d7fc9726b482-0.run.webtask.io/zen
*
* NOTE: it works only in public repositories.
*/
return function (context, callback) {
  if (!context.data.pull_request || context.data.action != "opened") {
    return callback();
  }

  console.log('Posting zen wisdom to pull request ' + context.data.pull_request.url);

  function headers() {
    if (!this.headersContent) {
      this.headersContent = {
        'Authorization': 'token '  + context.data.ZEN_TOKEN,
        'Accept': 'application/vnd.github.black-cat-preview+json',
        'User-Agent': context.data.ZEN_NAME
      }
    }

    return this.headersContent;
  }

  function post_pr_comment(wisdom) {
    var payload = {
      url: context.data.pull_request._links.comments.href,
      method: 'POST',
      body: {
        body: wisdom
      },
      json: true,
      headers: headers()
    }

    request(payload, function (error, res, body) {
      callback(error, body);
    });
  }

  request({ url: 'https://api.github.com/zen', method: 'GET', headers: headers()}, function (error, res, body) {
    if (error) {
      callback(error, body);
    } else {
      post_pr_comment(body);
    }
  });
}
