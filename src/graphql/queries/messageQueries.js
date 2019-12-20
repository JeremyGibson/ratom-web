import { gql } from 'apollo-boost';

// TODO: Add collectionId! filter: { collectionId: $collectionId }
export const FILTER_MESSAGES = gql`
  query FilterMessages($keyword: String) {
    filterMessages(
      search: { msgBody: { value: $keyword, boost: 2 } }
      facets: [labels, sent_date]
      highlight: [msg_body]
    ) {
      facets
      pageInfo {
        hasNextPage
        hasPreviousPage
        startCursor
        endCursor
      }
      edges {
        node {
          id
          pk
          msgFrom
          msgSubject
          msgBody
          sentDate
          processor
          highlight
          labels
        }
      }
    }
  }
`;

export const GET_MESSAGE = gql`
  query GetMessage($pk: Int) {
    message(pk: $pk) {
      sentDate
      labels
      msgTo
      msgFrom
      msgSubject
      msgBody
      processor {
        processed
        isRecord
        hasPii
      }
    }
  }
`;