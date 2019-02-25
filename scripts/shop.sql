CREATE TABLE Users (
  email         VARCHAR(255)  NOT NULL,
  username      VARCHAR(100)  PRIMARY KEY,
  password      VARCHAR(100)  NOT NULL,
  is_superuser  BOOLEAN       DEFAULT FALSE
);

CREATE TABLE Goods (
  code          INTEGER       PRIMARY KEY,
  title         VARCHAR(255)  NOT NULL,
  price         DECIMAL       NOT NULL,
  image         VARCHAR(500)  NULL,
  description   TEXT DEFAULT  NULL
);
