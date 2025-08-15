#!/bin/bash
# Generate a self-signed certificate for Spring Boot local HTTPS
echo "Generating keystore.p12 for Spring Boot HTTPS..."
keytool -genkeypair -alias devcert -keyalg RSA -keysize 2048 -storetype PKCS12 -keystore keystore.p12 -validity 3650 -storepass password -dname "CN=localhost"
echo "Move keystore.p12 to src/main/resources/ if not already."
