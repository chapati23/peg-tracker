#! /bin/bash
# shellcheck source=/dev/null
source .env
pubsub_cron_topic=projects/curve-pool-tracker/topics/cron-trigger
pubsub_cron_sub=projects/curve-pool-tracker/topics/cron-trigger-sub
data=$(echo "Cron Trigger!" | base64)

curl -s localhost:"$PORT" -X POST \
  -H "Content-Type: application/json" \
  -H "ce-id: 1234567890" \
  -H "ce-specversion: 1.0" \
  -H "ce-time: 2020-08-08T00:11:44.895529672Z" \
  -H "ce-type: google.cloud.pubsub.topic.v1.messagePublished" \
  -H "ce-source: //pubsub.googleapis.com/$pubsub_cron_topic" \
  -d '{
        "message": {
          "data": "'"$data"'",
          "attributes": {},
          "messageId": "133742069420",
          "publishTime": "2020-08-08T00:11:44.895529672Z"
        },
        "subscription": "'"$pubsub_cron_sub"'"
      }'
