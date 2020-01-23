import React, { useEffect, useState } from 'react';
import styled from 'styled-components';

// Axios
import Axios from '../../../../services/axiosConfig';
import { LIST_ACCOUNTS } from '../../../../services/requests';

// Router
import { useHistory } from 'react-router-dom';

// Children
import CollectionsListItem from './CollectionsListItem';
import AnimatedList from '../../../Components/Animated/AnimatedList';
import Spinner from '../../../Components/Loading/Spinner';

const CollectionsList = props => {
  const history = useHistory();
  const [loading, setLoading] = useState(false);
  const [_, setError] = useState();
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
  }, [Axios]);

  const setAccount = collection => {
    history.push(`/collections/${collection.id}`);
  };

  return (
    <CollectionsListStyled>
      {loading ? (
        <Spinner />
      ) : (
        accounts &&
        accounts.map(account => (
          <CollectionsListItem key={account.id} collection={account} setCollection={setAccount} />
        ))
      )}
    </CollectionsListStyled>
  );
};

const CollectionsListStyled = styled(AnimatedList)``;

export default CollectionsList;
