import React, {useState, useEffect} from 'react'
import Grid from '@material-ui/core/Grid'
import {makeStyles} from '@material-ui/core/styles'
import CartItems from './CartItems'
import {StripeProvider} from 'react-stripe-elements'
import config from './../../config/config'
import Checkout from './Checkout'

const useStyles = makeStyles(theme => ({
  root: {
    flexGrow: 1,
    margin: 30,
  }
}))
const key = "pk_test_Aj82uKSxBYyhfrQXVvaLHQ4N00IEmqlPhM"
export default function Cart () {
  const classes = useStyles()
  const [checkout, setCheckout] = useState(false)
  console.log(config.stripe_test_api_key)
  const showCheckout = val => {
    setCheckout(val)
  }

    return (<div className={classes.root}>
      <Grid container spacing={8}>
        <Grid item xs={6} sm={6}>
          <CartItems checkout={checkout}
                     setCheckout={showCheckout}/>
        </Grid>
        {checkout &&
          <Grid item xs={6} sm={6}>
            {/* <StripeProvider apiKey={config.stripe_test_api_key}> */}
            <StripeProvider apiKey={key}>
              <Checkout/>
            </StripeProvider>
          </Grid>}
        </Grid>
      </div>)
}
