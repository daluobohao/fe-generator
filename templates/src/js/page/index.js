import { testServer, handleRejectError, handleDataError } from '../api/api';
import '../../css/index.css';
import '../../img/test.png';

const errorHanlde = (e) => {
  console.error(e);
};

document.querySelector('h1').innerHTML = 'test3';
document.querySelector('#btn').addEventListener('click', () => {
  testServer({ id: 61 }).then((res) => {
    console.log(res);
  }, handleRejectError(errorHanlde))
    .catch(handleDataError(errorHanlde));
});
