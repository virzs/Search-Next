/*
 * @Author: Vir
 * @Date: 2021-11-01 17:07:24
 * @Last Modified by: Vir
 * @Last Modified time: 2021-11-01 17:35:19
 */
import LinearProgress, {
  linearProgressClasses,
} from '@material-ui/core/LinearProgress';
import { styled } from '@material-ui/core/styles';
import React from 'react';

const BorderLinearProgress = styled(LinearProgress)(({ theme }) => ({
  height: 12,
  borderRadius: 6,
  [`&.${linearProgressClasses.colorPrimary}`]: {
    backgroundColor:
      theme.palette.grey[theme.palette.mode === 'light' ? 200 : 800],
  },
  [`& .${linearProgressClasses.bar}`]: {
    borderRadius: 6,
  },
}));

export default BorderLinearProgress;
