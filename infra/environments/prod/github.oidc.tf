resource "aws_iam_openid_connect_provider" "github" {

  url            = "https://token.actions.githubusercontent.com"
  client_id_list = ["sts.amazonaws.com"]


}

data "aws_iam_policy_document" "github_actions_assume_role" {
  statement {
    effect  = "Allow"
    actions = ["sts:AssumeRoleWithWebIdentity"]

    principals {
      type        = "Federated"
      identifiers = [aws_iam_openid_connect_provider.github.arn]
    }

    condition {
      test     = "StringEquals"
      variable = "token.actions.githubusercontent.com:aud"
      values   = ["sts.amazonaws.com"]
    }

    condition {
      test     = "StringEquals"
      variable = "token.actions.githubusercontent.com:sub"
      values   = ["repo:garmaar@216600156/aws-cloud-resume@1359062742:ref:refs/heads/main"]
    }
  }
}

resource "aws_iam_role" "github_actions" {
  name = "github-actions-role"

  assume_role_policy = data.aws_iam_policy_document.github_actions_assume_role.json

}