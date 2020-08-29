import React, {useState, useEffect}  from 'react'
import Card from '@material-ui/core/Card'
import CardHeader from '@material-ui/core/CardHeader'
import CardMedia from '@material-ui/core/CardMedia'
import Typography from '@material-ui/core/Typography'
import Grid from '@material-ui/core/Grid'
import {makeStyles} from '@material-ui/core/styles'
import {read} from './api-chat.js'
import {Link} from 'react-router-dom'
import auth from '../auth/auth-helper'
import Timer from './Timer'
import ChatRoom from './ChatRoom_old'

const useStyles = makeStyles(theme => ({
  root: {
    flexGrow: 1,
    margin: 60,
  },
  flex:{
    display:'flex'
  },
  card: {
    padding:'24px 40px 40px'
  },
  subheading: {
    margin: '16px',
    color: theme.palette.openTitle
  },
  description: {
    margin: '16px',
    fontSize: '0.9em',
    color: '#4f4f4f'
  },
  price: {
    padding: '16px',
    margin: '16px 0px',
    display: 'flex',
    backgroundColor: '#93c5ae3d',
    fontSize: '1.3em',
    color: '#375a53',
  },
  media: {
    height: 300,
    display: 'inline-block',
    width: '100%',
  },
  icon: {
    verticalAlign: 'sub'
  },
  link:{
    color: '#3e4c54b3',
    fontSize: '0.9em'
  },
  itemInfo:{
      width: '35%',
      margin: '16px'
  },
  bidSection: {
      margin: '20px',
      minWidth: '50%'
  },
  lastBid: {
    color: '#303030',
    margin: '16px',
  }
}))

export default function Chat ({match}) {
  const classes = useStyles()
  const [chat, setchat] = useState({})
  const [error, setError] = useState('')
  const [justEnded, setJustEnded] = useState(false)

    useEffect(() => {
      const abortController = new AbortController()
      const signal = abortController.signal
  
      read({chatId: match.params.chatId}, signal).then((data) => {
        if (data.error) {
          setError(data.error)
        } else {
          setchat(data)
        }
      })
    return function cleanup(){
      abortController.abort()
    }
  }, [match.params.chatId])
  const updateBids = (updatedchat) => {
    setchat(updatedchat)
  }
  const update = () => {
    setJustEnded(true)
  }
  const imageUrl = chat._id
          ? `/api/chats/image/${chat._id}?${new Date().getTime()}`
          : '/api/chats/defaultphoto'
  const currentDate = new Date()
    return (
        <div className={classes.root}>
              <Card className={classes.card}>
                <CardHeader
                  title={chat.itemName}
                  subheader={<span>
                    {currentDate < new Date(chat.bidStart) && 'chat Not Started'}
                    {currentDate > new Date(chat.bidStart) && currentDate < new Date(chat.bidEnd) && 'chat Live'}
                    {currentDate > new Date(chat.bidEnd) && 'chat Ended'}
                    </span>}
                />
                <Grid container spacing={6}>
                  <Grid item xs={5} sm={5}>
                    <CardMedia
                        className={classes.media}
                        image={imageUrl}
                        title={chat.itemName}
                    />
                    <Typography component="p" variant="subtitle1" className={classes.subheading}>
                    About Item</Typography>
                    <Typography component="p" className={classes.description}>
                    {chat.description}</Typography>
                  </Grid>
                  
                  <Grid item xs={7} sm={7}>
                    {currentDate > new Date(chat.bidStart) 
                    ? (<>
                        <Timer endTime={chat.bidEnd} update={update}/> 
                        { chat.bids.length > 0 &&  
                            <Typography component="p" variant="subtitle1" className={classes.lastBid}>
                                {` Last bid: $ ${chat.bids[0].bid}`}
                            </Typography>
                        }
                        { !auth.isAuthenticated() && <Typography>Please, <Link to='/signin'>sign in</Link> to place your bid.</Typography> }
                        { auth.isAuthenticated() && <ChatRoom chat={chat} justEnded={justEnded} updateBids={updateBids}/> }
                      </>)
                    : <Typography component="p" variant="h6">{`chat Starts at ${new Date(chat.bidStart).toLocaleString()}`}</Typography>}
                  </Grid>
           
                </Grid>
                
              </Card>

        </div>)
}
