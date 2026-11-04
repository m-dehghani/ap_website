DO $$
BEGIN
  IF to_regclass('public.image_assets') IS NOT NULL
     AND EXISTS (SELECT 1 FROM "image_assets") THEN
    RAISE EXCEPTION
      'image_assets still contains data; run npm run migrate:uploads before applying this migration';
  END IF;
END
$$;

DROP TABLE IF EXISTS "image_assets";
