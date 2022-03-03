/*
 * @Author: Vir
 * @Date: 2022-03-02 14:21:41
 * @Last Modified by: Vir
 * @Last Modified time: 2022-03-02 14:52:04
 */
import React from 'react';
import { ToastContainer } from 'react-toastify';

function Container() {
  return (
    <ToastContainer
      position="top-right"
      autoClose={5000}
      hideProgressBar={true}
      newestOnTop={false}
      closeOnClick
      rtl={false}
      pauseOnFocusLoss
      draggable
      pauseOnHover
      theme="colored"
    />
  );
}

export default Container;
