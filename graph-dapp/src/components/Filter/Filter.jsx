import React from 'react'
import {
  Grid,
  FormControlLabel,
  Checkbox,
  createStyles,
  withStyles,
} from '@material-ui/core'

const filterStyles = theme =>
  createStyles({
    
  })

const Filter = ({
  classes,
  onToggleRari,
  onToggleSupr,
  Rari,
  Supr,
}) => (
  <Grid item>
    <Grid container direction="row">
      <FormControlLabel
        control={
          <Checkbox
            checked={Rari}
            onChange={event => onToggleRari && onToggleRari()}
          />
        }
        label="Rarible"
      />
      <FormControlLabel
        control={
          <Checkbox
            checked={Supr}
            onChange={event => onToggleSupr && onToggleSupr()}
          />
        }
        label="Super Rare"
      />

      <FormControlLabel
        control={
          <Checkbox
            checked={Supr}
            onChange={event => onToggleSupr && onToggleSupr()}
          />
        }
        label="Async Art"
      />
      
    </Grid>
  </Grid>
)

const StyledFilter = withStyles(filterStyles)(Filter)

export default StyledFilter
