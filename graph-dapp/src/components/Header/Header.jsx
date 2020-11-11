import React from 'react'
import { Grid, Typography } from '@material-ui/core'

const Header = () => (
  <Grid container direction="row" alignItems="center" spacing={16}>
    <Grid item>
      <Typography variant="title">ONCE NFTs Aggregator</Typography>
    </Grid>
  </Grid>
)

export default Header
