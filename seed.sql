CREATE TABLE `test_stamps` (
  `permutation` varchar(255) NOT NULL,
  `stamped` datetime NOT NULL,
  `stringed` varchar(255) NOT NULL,
  PRIMARY KEY (`permutation`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

INSERT INTO `test_stamps` (`permutation`, `stamped`, `stringed`)
VALUES
    (':::16', '2016-01-01 00:00:00', '2016-01-01 00:00:00')
,   (':::17', '2017-04-01 00:00:00', '2017-04-01 00:00:00')
,   (':::18', '2018-09-01 00:00:00', '2018-09-01 00:00:00')
;
