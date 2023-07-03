# Bot

## Webhook Testing

To run the bot via webhooks locally:

1. Use `ngrok http 8080` to expose your local bot to the internet
1. Update the PROD_WEBHOOK_URL env var in `.env` to your auto-generated ngrok
   URL (but store the previous value somewhere)
1. Run the bot with prod settings: `NODE_ENV=production turbo dev --filter bot`

Now you should be able to send requests to the bot that are being served from
your local server.
