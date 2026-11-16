-- Harmony CRM initial schema (PostgreSQL).
-- Column names follow Spring's default naming (camelCase field -> snake_case column).
-- Enums are stored as text (@Enumerated(EnumType.STRING)).

CREATE TABLE users (
    id            VARCHAR(64)  PRIMARY KEY,
    name          VARCHAR(255) NOT NULL,
    email         VARCHAR(255) NOT NULL,
    password_hash VARCHAR(255),
    role          VARCHAR(255),
    department    VARCHAR(255),
    avatar        VARCHAR(255),
    phone         VARCHAR(255),
    join_date     DATE,
    status        VARCHAR(255),
    CONSTRAINT uk_users_email UNIQUE (email)
);

CREATE TABLE departments (
    id          VARCHAR(64)  PRIMARY KEY,
    name        VARCHAR(255) NOT NULL,
    head_id     VARCHAR(255),
    description VARCHAR(255),
    created_at  DATE
);

CREATE TABLE leads (
    id           VARCHAR(64)      PRIMARY KEY,
    name         VARCHAR(255)     NOT NULL,
    email        VARCHAR(255),
    phone        VARCHAR(255),
    company      VARCHAR(255),
    status       VARCHAR(255),
    temperature  VARCHAR(255),
    score        INTEGER          NOT NULL,
    assigned_to  VARCHAR(255),
    deal_value   DOUBLE PRECISION NOT NULL,
    source       VARCHAR(255),
    notes        VARCHAR(2000),
    created_at   DATE,
    updated_at   DATE,
    last_contact DATE
);
CREATE INDEX idx_leads_status      ON leads (status);
CREATE INDEX idx_leads_assigned_to ON leads (assigned_to);
CREATE INDEX idx_leads_created_at  ON leads (created_at);

CREATE TABLE lead_tags (
    lead_id VARCHAR(64) NOT NULL REFERENCES leads (id),
    tag     VARCHAR(255)
);
CREATE INDEX idx_lead_tags_lead_id ON lead_tags (lead_id);

CREATE TABLE lead_activities (
    id           VARCHAR(64)  PRIMARY KEY,
    lead_id      VARCHAR(64)  REFERENCES leads (id),
    type         VARCHAR(255),
    description  VARCHAR(1000) NOT NULL,
    performed_by VARCHAR(255),
    created_at   TIMESTAMP
);
CREATE INDEX idx_lead_activities_lead_id ON lead_activities (lead_id);

CREATE TABLE tasks (
    id           VARCHAR(64)  PRIMARY KEY,
    title        VARCHAR(255) NOT NULL,
    description  VARCHAR(2000),
    status       VARCHAR(255),
    priority     VARCHAR(255),
    assigned_to  VARCHAR(255),
    created_by   VARCHAR(255),
    due_date     DATE,
    completed_at DATE,
    lead_id      VARCHAR(255),
    comments     INTEGER NOT NULL
);
CREATE INDEX idx_tasks_assigned_to ON tasks (assigned_to);
CREATE INDEX idx_tasks_status      ON tasks (status);

CREATE TABLE task_tags (
    task_id VARCHAR(64) NOT NULL REFERENCES tasks (id),
    tag     VARCHAR(255)
);
CREATE INDEX idx_task_tags_task_id ON task_tags (task_id);

CREATE TABLE goals (
    id            VARCHAR(64)      PRIMARY KEY,
    user_id       VARCHAR(255),
    title         VARCHAR(255)     NOT NULL,
    target_value  DOUBLE PRECISION NOT NULL,
    current_value DOUBLE PRECISION NOT NULL,
    unit          VARCHAR(255),
    period        VARCHAR(255),
    due_date      DATE
);
CREATE INDEX idx_goals_user_id ON goals (user_id);

CREATE TABLE attendance_records (
    id           VARCHAR(64) PRIMARY KEY,
    user_id      VARCHAR(255),
    record_date  DATE,
    check_in     TIME,
    check_out    TIME,
    status       VARCHAR(255),
    hours_worked DOUBLE PRECISION
);
CREATE INDEX idx_attendance_user_date ON attendance_records (user_id, record_date);

CREATE TABLE notifications (
    id         VARCHAR(64)   PRIMARY KEY,
    user_id    VARCHAR(255),
    title      VARCHAR(255),
    message    VARCHAR(1000),
    type       VARCHAR(255),
    is_read    BOOLEAN       NOT NULL,
    created_at TIMESTAMP
);
CREATE INDEX idx_notifications_user_id ON notifications (user_id);
