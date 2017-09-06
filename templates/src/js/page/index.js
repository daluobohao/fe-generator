import { testGet, testPost, testFileUpload } from '../api/api';
import '../../css/index.css';
import '../../img/test.png';

const errorHanlder = (err) => {
  console.error(err);
};

document.querySelector('h1').innerHTML = 'test3';
document.querySelector('#btn1').addEventListener('click', () => {
  testGet({ id: 61 }).then((res) => {
    console.log(res);
  })
  .catch(errorHanlder);
});

document.querySelector('#btn2').addEventListener('click', () => {
  testPost({ id: 61 }).then((res) => {
    console.log(res);
  })
    .catch(errorHanlder);
});

document.querySelector('#btn3').addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (!file) {
    alert('请选择图片');
  }
  testFileUpload({
    id: 61,
    test: file,
  }).then((res) => {
    console.log(res);
  })
    .catch(errorHanlder);
});
