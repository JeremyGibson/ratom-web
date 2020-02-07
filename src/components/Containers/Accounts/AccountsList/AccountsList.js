import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { LIST_ITEM_VARIANTS, LIST_VARIANTS } from '../../../Components/Animated/animationConstants';

// Axios
import Axios from '../../../../services/axiosConfig';
import { LIST_ACCOUNTS } from '../../../../services/requests';

// Router
import { useHistory } from 'react-router-dom';

// Children
import AccountsListItem from './AccountsListItem';
import Spinner from '../../../Components/Loading/Spinner';

const AccountsList = props => {
  const history = useHistory();
  const [loading, setLoading] = useState(false);
  const [, setError] = useState();
  const [accounts, setAccounts] = useState();

  useEffect(() => {
    setLoading(true);
    Axios.get(LIST_ACCOUNTS)
      .then(response => {
        setAccounts(response.data);
        setLoading(false);
      })
      .catch(error => {
        setError(error);
        setLoading(false);
      });
  }, []);

  const setAccount = account => {
    history.push(`/accounts/${account.id}`);
  };

  return (
    <AccountsListStyled initial="initial" animate="enter" exit="exit" variants={LIST_VARIANTS}>
      {loading ? (
        <SpinnerStyled flex large />
      ) : (
        accounts &&
        accounts.map(account => (
          <AccountsListItem
            key={account.id}
            account={account}
            setAccount={setAccount}
            variants={LIST_ITEM_VARIANTS}
          />
        ))
      )}
    </AccountsListStyled>
  );
};

const AccountsListStyled = styled(motion.div)`
  display: flex;
  flex-direction: column;
  flex: 1;
`;

const SpinnerStyled = styled(Spinner)`
  margin-top: 5rem;
`;

export default AccountsList;