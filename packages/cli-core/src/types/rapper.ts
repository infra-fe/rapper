import { RAPPER_TYPE, IUrlMapper } from './common';
export interface IRapperParams {
  projectId?: string | number;
  token?: string;
  /** required，redux、normal ... */
  type: RAPPER_TYPE;
  /** required，api repository url，get from repository data button */
  apiUrl: string;
  /** optional，rap platform url，default is . */
  rapUrl?: string;
  /** optional，rap，generate the folder address of rapper, default ./src/rapper */
  rapperPath?: string;
  /** optional，URL mapping, which can be used to map complex URLs to simple URLs */
  urlMapper?: IUrlMapper;
  /** optional，format of output template code */
  codeStyle?: {};
  /** optional，type conversion type Selector<T> = T */
  resSelector?: string;
}
