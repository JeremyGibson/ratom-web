import React, { useEffect, createContext, useState } from 'react';
import styled from 'styled-components';

// Axios
import Axios from '../../../services/axiosConfig';
import { SHOW_MESSAGE } from '../../../services/requests';

// Deps
import { useAlert } from 'react-alert';

// Router
import { useParams } from 'react-router-dom';

// Children
import MessageHeader from './MessageHeader';
import MessageDetail from './MessageDetail';
import MessageFooter from './MessageFooter';
import Spinner from '../../Components/Loading/Spinner';
import MessageDetailFilters from './MessageDetailFilters';

export const MessageContext = createContext();

const MessageMain = () => {
  const alert = useAlert();
  const { messageId } = useParams();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(false);

  useEffect(() => {
    setLoading(true);
    Axios.get(SHOW_MESSAGE + `${messageId}/`)
      .then(response => {
        setMessage(response.data);
        setLoading(false);
      })
      .catch(error => {
        console.warn('Error: ', error && error.message);
        setLoading(false);
        alert.error('An error occured while fetching this message, please try again.');
      });
  }, []);

  const messageContext = { message, setMessage };

  return (
    <MessageContext.Provider value={messageContext}>
      <MessageMainStyled>
        {loading || !message ? (
          <Spinner />
        ) : (
          <>
            <MessageHeader />
            <MessageContent>
              <MessageDetailFilters />
              <MessageDetail />
            </MessageContent>
            <MessageFooter />
          </>
        )}
      </MessageMainStyled>
    </MessageContext.Provider>
  );
};

const MessageMainStyled = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow-y: hidden;
`;

const MessageContent = styled.div`
  flex: 1;
  display: flex;
  overflow-y: hidden;
  width: 100%;
`;

export default MessageMain;
