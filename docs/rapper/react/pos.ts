/* md5: 6bf221f3e9c0012a379389d99b34f32a */
/* Rap repository id: 308 */
/* @infra/generation version: 3.0.1-beta.2 */
/* eslint-disable */
/* tslint:disable */
// @ts-nocheck

/**
 * This file is automatically generated by Rapper to synchronize the Rap platform interface, please do not modify
 * Rap repository url: ./repository/editor?id=308
 */

export const POS_MAP = {
  /**
   * Interface name：示例接口
   * Rap url: ./repository/editor?id=308&mod=1904&itf=11880
   *
   */
  'GET/example/1660824554985': {
    Query: ['foo'],
  },
  /**
   * Interface name：带params的post
   * Rap url: ./repository/editor?id=308&mod=1904&itf=12807
   *
   */
  'POST/user/info': {
    Query: ['name'],
    Body: ['age'],
  },
  /**
   * Interface name：带header的post
   * Rap url: ./repository/editor?id=308&mod=1904&itf=12808
   *
   */
  'POST/user/info/header': {
    Header: ['token'],
    Query: ['name'],
    Body: ['age'],
  },
  /**
   * Interface name：basic get
   * Rap url: ./repository/editor?id=308&mod=1904&itf=12809
   *
   */
  'GET/user/list': {
    Query: ['name'],
  },
  /**
   * Interface name：get with header
   * Rap url: ./repository/editor?id=308&mod=1904&itf=12810
   *
   */
  'GET/user/list/header': {
    Header: ['token'],
    Query: ['name'],
  },
};