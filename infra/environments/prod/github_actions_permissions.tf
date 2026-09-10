data "aws_iam_policy_document" "github_actions_permissions" {

  statement {
    effect = "Allow"

    actions = [
      "s3:*",
      "cloudfront:*",
      "lambda:*",
      "dynamodb:*",
      "apigateway:*",
      "apigatewayv2:*",
      "iam:*",
      "budgets:*"
    ]

    resources = ["*"]
  }
}

resource "aws_iam_policy" "github_actions_permissions" {

  name = "aws-cloud-resume-github-actions-policy"

  policy = data.aws_iam_policy_document.github_actions_permissions.json

}

resource "aws_iam_role_policy_attachment" "github_actions_permissions" {

  role = aws_iam_role.github_actions.name

  policy_arn = aws_iam_policy.github_actions_permissions.arn

}