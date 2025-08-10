import React, { useContext, useEffect, useState } from 'react'
import { AuthContext } from '../contexts/AuthContext'
import { useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Button from '@mui/material/Button';
import HomeIcon from '@mui/icons-material/Home';

export default function History() {

    const {getUserHistory} = useContext(AuthContext);
    let [meetings,setMeetings] = useState([]);

    const routeTo = useNavigate();
    let formatDate = (dateString) =>{
        const date = new Date(dateString);
        const day = date.getDate().toString().padStart(2,'0');
        const month=(date.getMonth()+1).toString().padStart(2,'0');
        const year = date.getFullYear();
        return `${day}/${month}/${year} - ${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`
    }
    useEffect(()=>{
        const fetchHistory = async ()=>{
            try {
                const history = await getUserHistory();
                setMeetings(history);
            } catch (e) {
                //IMPLEMENT SNACKBAR with Err
            }
        }
        fetchHistory();
    },[])
  return (
    <div>
        <Button onClick={()=>{
            routeTo('/home')
        }}>
            <HomeIcon color="primary" />
        </Button>
        {meetings.length !== 0 ?meetings.map((e,i) =>{
            return (
                <Box key={i}>
      <Card variant="outlined">
        Meeting Code : {e.meetingCode}<br />
        Date : {formatDate(e.date)}
      </Card>
    </Box>
            )
        }) : <></> }
    </div>
  )
}
