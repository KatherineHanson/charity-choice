'use strict';

const {Router} = require('express');
const Charity = require('../model/charity.js');
const bearerAuth = require('../lib/bearer-auth-middleware.js');

const charityRouter = module.exports = new Router();

charityRouter.get('/charities', bearerAuth, (req, res, next) => {
  let {page='0'} = req.query;
  page = Number(page);
  if(isNaN(page))
    page=0;
  page = page < 0 ? 0 : page;

  let charitiesCache;
  Charity.find({})
    .skip(page * 100)
    .limit(100)
    .then(charities => {
      charitiesCache = charities;
      return Charity.find({}).count();
    })
    .then(count => {
      let result = {
        count,
        data: charitiesCache,
      };

      let lastPage = Math.floor(count / 100);
      res.links({
        next: `http://localhost/charities?page=${page+1}`,
        prev: `http://localhost/charities?page=${page < 1 ? 0 : page - 1}`,
        last: `http://localhost/charities?page=${lastPage}`,
      });
      res.json(result);
    })
    .catch(next);
});
