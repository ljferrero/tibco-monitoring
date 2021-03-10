--
-- Cleanup the data between the given timestamp.
-- Provide low_timestamp and high_timestamp value.
--
DEFINE low_timestamp;
DEFINE high_timestamp;

--
-- Delete data for table activityloggingstats
--
DELETE FROM "activityloggingstats"
WHERE "timestmp" BETWEEN '&&low_timestamp' AND '&&high_timestamp';
COMMIT;

--
-- Delete data for table processinstanceloggingstats
--
DELETE FROM "processinstanceloggingstats"
WHERE "timestmp" BETWEEN '&low_timestamp' AND '&high_timestamp';
COMMIT;

--
-- Delete data for table transitionloggingstats
--
DELETE FROM "transitionloggingstats"
WHERE "timestmp" BETWEEN '&low_timestamp' AND '&high_timestamp';
COMMIT;

UNDEFINE low_timestamp;
UNDEFINE high_timestamp;

