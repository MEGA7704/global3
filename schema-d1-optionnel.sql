-- Schéma D1 optionnel pour une future version connectée Cloudflare D1.
CREATE TABLE companies(id TEXT PRIMARY KEY,name TEXT,owner TEXT,phone TEXT,email TEXT,business_type TEXT,status TEXT,plan TEXT,subscription_start TEXT,subscription_end TEXT,created_at TEXT);
CREATE TABLE users(id TEXT PRIMARY KEY,company_id TEXT,name TEXT,email TEXT,password_hash TEXT,role TEXT,status TEXT,created_at TEXT);
CREATE TABLE items(id TEXT PRIMARY KEY,company_id TEXT,code TEXT,name TEXT,category TEXT,type TEXT,buy REAL,sell REAL,stock REAL,charge REAL,created_at TEXT);
CREATE TABLE sales(id TEXT PRIMARY KEY,company_id TEXT,user_id TEXT,client TEXT,name TEXT,qty REAL,unit REAL,total REAL,charges REAL,profit REAL,date TEXT);
CREATE TABLE payments(id TEXT PRIMARY KEY,company_id TEXT,amount REAL,plan TEXT,date TEXT);
