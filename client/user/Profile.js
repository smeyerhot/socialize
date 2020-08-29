import React, { useState, useEffect } from 'react'
import {makeStyles} from '@material-ui/core/styles'
import Paper from '@material-ui/core/Paper'
import List from '@material-ui/core/List'
import ListItem from '@material-ui/core/ListItem'
import ListItemAvatar from '@material-ui/core/ListItemAvatar'
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction' 
import ListItemText from '@material-ui/core/ListItemText' 
import Avatar from '@material-ui/core/Avatar'
import IconButton from '@material-ui/core/IconButton'
import Typography from '@material-ui/core/Typography'
import Edit from '@material-ui/icons/Edit'
import Divider from '@material-ui/core/Divider'
import DeleteUser from './DeleteUser'
import auth from './../auth/auth-helper'
import {read} from './api-user.js'
import {Redirect, Link} from 'react-router-dom'
import FollowProfileButton from './../user/FollowProfileButton'
import ProfileTabs from './../user/ProfileTabs'
import {listByUser} from './../post/api-post.js'
import config from './../../config/config'
import stripeButton from './../assets/images/stripeButton.png'
import MyOrders from './../order/MyOrders'
import Auctions from './../auction/Auctions'
import {listByBidder} from './../auction/api-auction.js'

const useStyles = makeStyles(theme => ({
  root: theme.mixins.gutters({
    maxWidth: 600,
    margin: 'auto',
    padding: theme.spacing(3),
    marginTop: theme.spacing(5)
  }),
  title: {
    margin: `${theme.spacing(2)}px ${theme.spacing(1)}px 0`,
    color: theme.palette.protectedTitle,
    fontSize: '1em'
  },
  bigAvatar: {
    width: 60,
    height: 60,
    margin: 10
  }
}))

export default function Profile({ match }) {
  const classes = useStyles()
  const [values, setValues] = useState({
    user: {following:[], followers:[]},
    redirectToSignin: false,
    following: false
  })
  const [posts, setPosts] = useState([])
  // const [redirectToSignin, setRedirectToSignin] = useState(false)
  const jwt = auth.isAuthenticated()

  const [auctions, setAuctions] = useState([])
  console.log(match)
  console.log(values)
  useEffect(() => {
    const abortController = new AbortController()
    const signal = abortController.signal
  
    read({
      userId: match.params.userId
    }, {t: jwt.token}, signal).then((data) => {
      if (data && data.error) {
        setValues({...values, redirectToSignin: true})
      } else {
        let following = checkFollow(data)
        setValues({...values, user: data, following: following})
        loadPosts(data._id)
      }
    })
    return function cleanup(){
      abortController.abort()
    }                               

  }, [match.params.userId])


  useEffect(() => {
    const abortController = new AbortController()
    const signal = abortController.signal
    listByBidder({
      userId: match.params.userId
    }, {t: jwt.token}, signal).then((data) => {
      if (data.error) {
        setRedirectToSignin(true)
      } else {
        setAuctions(data)
      }
    })
    return function cleanup(){
      abortController.abort()
    }
  }, [])
  const removeAuction = (auction) => {
    const updatedAuctions = [...auctions]
    const index = updatedAuctions.indexOf(auction)
    updatedAuctions.splice(index, 1)
    setAuctions(updatedAuctions)
  }

    
  console.log(values)
  const checkFollow = (user) => {
    const match = user.followers.some((follower)=> {
      return follower._id == jwt.user._id
    })
    return match
  }
  const clickFollowButton = (callApi) => {
    callApi({
      userId: jwt.user._id
    }, {
      t: jwt.token
    }, values.user._id).then((data) => {
      if (data.error) {
        setValues({...values, error: data.error})
      } else {
        setValues({...values, user: data, following: !values.following})
      }
    })
  }
  const loadPosts = (user) => {
    listByUser({
      userId: user
    }, {
      t: jwt.token
    }).then((data) => {
      if (data.error) {
        console.log(data.error)
      } else {
        setPosts(data)
      }
    })
  }
  const removePost = (post) => {
    const updatedPosts = posts
    const index = updatedPosts.indexOf(post)
    updatedPosts.splice(index, 1)
    setPosts(updatedPosts)
  }

    const photoUrl = values.user._id
              ? `/api/users/photo/${values.user._id}?${new Date().getTime()}`
              : '/api/users/defaultphoto'
    if (values.redirectToSignin) {
      return <Redirect to='/signin'/>
    }
    console.log(values)
    return (
      <Paper className={classes.root} elevation={4}>
        <Typography variant="h6" className={classes.title}>
          Profile
        </Typography>
        <List dense>
          <ListItem>
            <ListItemAvatar>
              <Avatar src={photoUrl} className={classes.bigAvatar}/>
            </ListItemAvatar>
            <ListItemText primary={values.user.name} secondary={values.user.email}/> {
             auth.isAuthenticated().user && auth.isAuthenticated().user._id == values.user._id
             ? (<ListItemSecondaryAction>
                  <Link to={"/user/edit/" + values.user._id}>
                    <IconButton aria-label="Edit" color="primary">
                      <Edit/>
                    </IconButton>
                  </Link>
                  <DeleteUser userId={values.user._id}/>
                </ListItemSecondaryAction>)
            : (<FollowProfileButton following={values.following} onButtonClick={clickFollowButton}/>)
            }
            </ListItem>
            <ListItem>
            <ListItemText primary={values.user.name} secondary={values.user.email}/> {
             auth.isAuthenticated().user && auth.isAuthenticated().user._id == values.user._id &&
             (<ListItemSecondaryAction>
               {values.user.seller &&
                 (values.user.stripe_seller
                   ? (<Button variant="contained" disabled className={classes.stripe_connected}>
                       Stripe connected
                      </Button>)
                   : (<a href={"https://connect.stripe.com/oauth/authorize?response_type=code&client_id="+config.stripe_connect_test_client_id+"&scope=read_write"} className={classes.stripe_connect}>
                       <img src={stripeButton}/>
                      </a>)
                  )
                }
            </ListItemSecondaryAction>)
            }
          </ListItem>
          <Divider/>
          <ListItem>
            <ListItemText primary={values.user.about} secondary={"Joined: " + (
              new Date(values.user.created)).toDateString()}/>
          </ListItem>
        </List>
        <MyOrders/>
        <Paper className={classes.auctions} elevation={4}>
          <Typography type="title" color="primary">
              Auctions you bid in
          </Typography>
          <Auctions  auctions={auctions} removeAuction={removeAuction} />
        </Paper>
        <ProfileTabs user={values.user} posts={posts} removePostUpdate={removePost}/>
      </Paper>
    )
}


