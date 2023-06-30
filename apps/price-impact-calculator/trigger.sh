#!/bin/bash
pubsub_topic="price-impact-calculation-request"
pubsub_sub="price-impact-calculations"
alert=$(echo "MIM-to-USD-via-USDC" | base64)
curl -s localhost:8082 \
  -X POST \
  -H "Content-Type: application/json" \
  -H "ce-id: 123451234512345" \
  -H "ce-specversion: 1.0" \
  -H "ce-time: 2020-01-02T12:34:56.789Z" \
  -H "ce-type: google.cloud.pubsub.topic.v1.messagePublished" \
  -H "ce-source: //pubsub.googleapis.com/projects/curve-pool-tracker/topics/$pubsub_topic" \
  -d '{
        "message": {
          "data": "'"$alert"'",
          "messageId": "133742069420"
        },
        "subscription": "projects/curve-pool-tracker/subscriptions/'$pubsub_sub'"
      }'
