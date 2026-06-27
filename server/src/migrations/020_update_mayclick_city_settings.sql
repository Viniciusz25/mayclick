-- Description: Update Mayclick city references in persisted business settings

UPDATE business_settings
SET
  address = CASE
    WHEN address IS NULL OR trim(address) = '' OR address IN ('São Paulo, SP', 'Guarulhos - SP', 'Guarulhos – SP')
      THEN 'Mogi das Cruzes - SP'
    ELSE replace(replace(address, 'Guarulhos – SP', 'Mogi das Cruzes - SP'), 'Guarulhos - SP', 'Mogi das Cruzes - SP')
  END,
  pdf_footer = CASE
    WHEN pdf_footer IS NULL THEN pdf_footer
    ELSE replace(replace(pdf_footer, 'Guarulhos – SP', 'Mogi das Cruzes - SP'), 'Guarulhos - SP', 'Mogi das Cruzes - SP')
  END,
  updated_at = CURRENT_TIMESTAMP;
