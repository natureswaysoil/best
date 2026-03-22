from google.cloud import secretmanager
PROJECT_ID = "natureswaysoil-video"
SECRET_MAP = {
    "HEYGEN_API_KEY":                "HEYGEN_API_KEY",
    "ANTHROPIC_API_KEY":             "ANTHROPIC_ADMIN_API_KEY",
    "INSTAGRAM_ACCESS_TOKEN":        "INSTAGRAM_ACCESS_TOKEN",
    "INSTAGRAM_BUSINESS_ACCOUNT_ID": "INSTAGRAM_IG_ID",
    "FACEBOOK_PAGE_ID":              "FACEBOOK_PAGE_ID",
    "FACEBOOK_ACCESS_TOKEN":         "FACEBOOK_ACCESS_TOKEN",
    "YOUTUBE_CLIENT_ID":             "YT_CLIENT_ID",
    "YOUTUBE_CLIENT_SECRET":         "YT_CLIENT_SECRET",
    "YOUTUBE_REFRESH_TOKEN":         "YT_REFRESH_TOKEN",
}
def get_secrets(project_id=PROJECT_ID):
    client = secretmanager.SecretManagerServiceClient()
    secrets = {}
    for key, gcp_name in SECRET_MAP.items():
        path = f"projects/{project_id}/secrets/{gcp_name}/versions/latest"
        try:
            resp = client.access_secret_version(request={"name": path})
            secrets[key] = resp.payload.data.decode("UTF-8").strip()
            print(f"  OK  {key}")
        except Exception as e:
            secrets[key] = ""
            print(f"  MISSING  {key}")
    return secrets
