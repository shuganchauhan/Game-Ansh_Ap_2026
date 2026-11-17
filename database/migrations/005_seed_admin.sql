-- Seed default platform admin account
INSERT INTO "admin" (email, password_hash)
VALUES ('shagunaaryanansh@flux.com', '$2b$12$XArKaGsW1/dLRnEpGySd8ORzJ.zgEIdnmdGB2THTMSX7Xd/Xi3D2O')
ON CONFLICT (email) DO NOTHING;
