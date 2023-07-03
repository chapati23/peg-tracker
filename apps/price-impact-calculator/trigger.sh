#! /bin/bash
# shellcheck source=/dev/null
source .env
data=$(echo "MIM-to-USD-via-USDC" | base64)

curl -s localhost:"$PORT" -X POST \
  -H "Content-Type: application/json" \
  -H "ce-id: 123451234512345" \
  -H "ce-specversion: 1.0" \
  -H "ce-time: 2020-01-02T12:34:56.789Z" \
  -H "ce-type: google.cloud.pubsub.topic.v1.messagePublished" \
  -H "ce-source: //pubsub.googleapis.com/$PUBSUB_TOPIC" \
  -d '{
        "message": {
          "data": "'"$data"'",
          "attributes": {},
          "messageId": "133742069420",
          "publishTime": "2020-08-08T00:11:44.895529672Z"
        },
        "subscription": "'"$PUBSUB_SUBSCRIPTION"'"
      }'
