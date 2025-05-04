enum ApiBasePath {
  BASE_PATH = '/',
}

export enum ApiRoutes {
  BASE_PATH = ApiBasePath.BASE_PATH,
  API = `${ApiBasePath.BASE_PATH}api/`,
  AUTH = `${ApiBasePath.BASE_PATH}auth/`,
  FILE = `${ApiBasePath.BASE_PATH}file/`,
}
