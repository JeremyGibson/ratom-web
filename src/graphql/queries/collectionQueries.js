import { gql } from "apollo-boost";

export const emailQuery = ({ emailId }) => {
  return `
        query {
            email(id: ${emailId}) {
                subject
                content
            }
        }
    `;
};

export const ALL_COLLECTIONS = gql`
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

export const SingleMessageQuery = gql`
  query SingleMessageQuery($currentMessageId: ID!) {
    message(id: $currentMessageId) {
      id
      messageId
      msgFrom
      msgTo
      msgSubject
      sentDate
      msgBody
    }
  }
`;

export const getCustomMessagesQuery = searchBy => {
  return gql`
  query ($searchString: String) {
    allMessages(${searchBy}_Icontains: $searchString) {
      pageInfo {
        hasNextPage
        endCursor
      }
      edges {
        node {
          id
          messageId
          msgFrom
          msgTo
          msgSubject
          sentDate
          msgBody
        }
      }
    }
  }
`
};