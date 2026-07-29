@REM ----------------------------------------------------------------------------
@REM Maven Start Up Batch script
@REM ----------------------------------------------------------------------------
@echo off
set MAVEN_PROJECTBASEDIR=%~dp0
set MAVEN_WRAPPER_JAR=%MAVEN_PROJECTBASEDIR%.mvn\wrapper\maven-wrapper.jar

IF NOT EXIST "%MAVEN_WRAPPER_JAR%" (
    echo Downloading Maven Wrapper...
)

java -jar "%MAVEN_WRAPPER_JAR%" %*
