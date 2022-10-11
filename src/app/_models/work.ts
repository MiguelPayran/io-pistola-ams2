export class Work {
  user: string; // username loged in
  url: string; // last url that you have worked in the process
  data: any;   // data related with the processs

  constructor(user, url, data) {
    this.user = user;
    this.url = url;
    this.data = data;
  }
}