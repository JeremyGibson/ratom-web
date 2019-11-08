import React, { useContext, useEffect } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@apollo/react-hooks";
import { gql } from "apollo-boost";
import AppContext from "../app-state";

const ALL_COLLECTIONS = gql`
  {
    allCollections {
      edges {
        node {
          id
          title
          accessionDate
        }
      }
    }
  }
`;

const CollectionList = props => {
  const { collections, setCollections } = useContext(AppContext);
  const { loading, error, data } = useQuery(ALL_COLLECTIONS);

  useEffect(() => {
    if (data && data.allCollections.edges.length) {
      const collectionData = data.allCollections.edges.map(item => {
        return {
          title: item.node.title,
          id: item.node.id,
          accessionDate: item.node.accessionDate
        };
      });
      setCollections(collectionData);
    }
  }, [data, loading, setCollections]);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error :(</p>;

  return (
    <>
      <h2>Collections</h2>
      {collections &&
        collections.map(collection => (
          <nav key={collection.id}>
            <Link to={`/collection/${collection.id}`}>{collection.title}</Link>
          </nav>
        ))}
    </>
  );
};

export default CollectionList;
