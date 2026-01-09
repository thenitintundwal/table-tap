-- Add Telegram notification fields to cafes table
ALTER TABLE cafes ADD COLUMN IF NOT EXISTS telegram_bot_token TEXT;
ALTER TABLE cafes ADD COLUMN IF NOT EXISTS telegram_chat_id TEXT;

-- Add comment for documentation
COMMENT ON COLUMN cafes.telegram_bot_token IS 'Telegram Bot Token for order notifications';
COMMENT ON COLUMN cafes.telegram_chat_id IS 'Telegram Chat ID or Group ID where notifications will be sent';
