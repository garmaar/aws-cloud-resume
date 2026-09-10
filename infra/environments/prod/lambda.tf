data "aws_iam_policy_document" "lambda_assume_role" {

  statement {
    effect  = "Allow"
    actions = ["sts:AssumeRole"]

    principals {
      type        = "Service"
      identifiers = ["lambda.amazonaws.com"]
    }
  }
}


resource "aws_iam_role" "lambda" {
  name = "aws-cloud-resume-lambda-role"

  assume_role_policy = data.aws_iam_policy_document.lambda_assume_role.json

}

data "aws_iam_policy_document" "lambda_dynamodb" {

  statement {
    effect  = "Allow"
    actions = ["dynamodb:UpdateItem"]

    resources = [aws_dynamodb_table.visitors.arn]
  }

}

resource "aws_iam_policy" "lambda_dynamodb" {

  name   = "aws-cloud-resume-lambda-dynamodb"
  policy = data.aws_iam_policy_document.lambda_dynamodb.json
}

resource "aws_iam_role_policy_attachment" "lambda_dynamodb" {
  role       = aws_iam_role.lambda.name
  policy_arn = aws_iam_policy.lambda_dynamodb.arn



}

resource "aws_iam_role_policy_attachment" "lambda_logs" {
  role       = aws_iam_role.lambda.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"


}

data "archive_file" "visitor_counter" {
  type        = "zip"
  source_file = "${path.module}/../../../functions/visitor-counter/src/handler.py"
  output_path = "${path.module}/../../../functions/visitor-counter/build/visitor_counter.zip"

}

resource "aws_lambda_function" "visitor_counter" {

  function_name = "aws-cloud-resume-visitor-counter"
  role          = aws_iam_role.lambda.arn

  filename         = data.archive_file.visitor_counter.output_path
  source_code_hash = data.archive_file.visitor_counter.output_base64sha256

  handler = "handler.lambda_handler"
  runtime = "python3.14"

  environment {
    variables = {
      TABLE_NAME = aws_dynamodb_table.visitors.name
    }

  }




}

