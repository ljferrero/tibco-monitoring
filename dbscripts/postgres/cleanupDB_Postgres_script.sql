--
-- Cleanup the data between the given timestamp.
-- Provide low_timestamp and high_timestamp value.
-- (e.g. DECLARE low_timestamp bigint = 1578644799840;).
--

DO '
DECLARE low_timestamp BIGINT = 0;
DECLARE high_timestamp BIGINT = 1578644799840;

BEGIN
--
-- Delete data for table ActivityLoggingStats
--
DELETE FROM activityloggingstats WHERE timestmp BETWEEN low_timestamp AND high_timestamp;

--
-- Delete data for table ProcessInstanceLoggingStats
--
DELETE FROM processinstanceloggingstats WHERE timestmp BETWEEN low_timestamp AND high_timestamp;

--
-- Delete data for table TransitionLoggingStats
--
DELETE FROM transitionloggingstats WHERE timestmp BETWEEN low_timestamp AND high_timestamp;

END
' ;
