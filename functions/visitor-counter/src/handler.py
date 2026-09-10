import boto3
import os
import json

TABLE_NAME = os.environ["TABLE_NAME"]

dynamodb = boto3.resource("dynamodb")
table = dynamodb.Table(TABLE_NAME)


def lambda_handler(event, context):
    response = table.update_item(
        Key={"id": "visitors"},
        UpdateExpression="ADD visits :increment",

        ExpressionAttributeValues={
        ":increment": 1
        },

        ReturnValues="UPDATED_NEW"
    )

    count = int(response["Attributes"]["visits"])
    return {
    "statusCode": 200,
    "body": json.dumps({
        "visits": count
    })
}
