CREATE TABLE Users (
  email         VARCHAR(255),
  username      VARCHAR(100)  PRIMARY KEY,
  password      VARCHAR(100),
  is_superuser  BOOLEAN DEFAULT FALSE
);
