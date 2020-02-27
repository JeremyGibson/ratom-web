describe('Filter panel behavior', () => {
  before(() => {
    cy.login();
    cy.server();
    cy.initialize_account();
  });

  describe('Limit to account', () => {
    it('having selected an account to view, filtering messages returns only messages from that account', () => {
      const accountId = Cypress.env('accountId');
      const accountParam = Cypress.env('accountParam');
      cy.route('GET', `/api/v1/messages/?${accountParam}`).as('queryMessages');
      cy.goToMessagesList();
      cy.url().should('include', `/accounts/${accountId}`);
      cy.wait('@queryMessages');
      cy.get('@queryMessages').should(request => {
        const queryParams = request.url.split('?')[1];
        expect(queryParams).to.eq(`${accountParam}`);
      });
    });

    describe('Keyword filter', () => {
      const keywordSearchTerm = 'computer';
      const accountParam = Cypress.env('accountParam');
      const expectedQueryParams = `${accountParam}search_simple_query_string=${keywordSearchTerm} &`;
      it('typing a keyword into the input and clicking the button adds a keyword to the list', () => {
        cy.get('[data-cy="keyword_search"]').within(() => {
          cy.get('[data-cy="keyword_search_input"]').type(keywordSearchTerm);
          cy.get('[data-cy="button_icon"]').click();
          cy.get('[data-cy="keyword"]').contains(keywordSearchTerm);
        });
      });

      it('clicking the "x" on a keyword removes it from the list', () => {
        cy.get('[data-cy="keyword_search"]').within(() => {
          cy.get('[data-cy="keyword_list"]')
            .children()
            .should('have.length', 1);
          cy.get('[data-cy="keyword_close"]').click();
          cy.get('[data-cy="keyword_list"]')
            .children()
            .should('have.length', 0);
        });
      });

      it('typing a keyword into the input and hitting enter adds one keyword to the list', () => {
        cy.get('[data-cy="keyword_search"]').within(() => {
          cy.get('[data-cy="keyword_search_input"]').type(`${keywordSearchTerm} {enter}`);
          cy.get('[data-cy="keyword"]').contains(keywordSearchTerm);
          cy.get('[data-cy="keyword_list"]')
            .children()
            .should('have.length', 1);
        });
      });

      it('pressing shift+backspace while focus is in keyword search removes last keyword entered', () => {
        cy.get('[data-cy="keyword_search"]').within(() => {
          cy.get('[data-cy="keyword_search_input"]').type(`${keywordSearchTerm} again {enter}`);
          cy.get('[data-cy="keyword_list"]')
            .children()
            .should('have.length', 2);
          cy.get('[data-cy="keyword_search_input"]').type('{shift}{backspace}');
          cy.get('[data-cy="keyword_list"]')
            .children()
            .should('have.length', 1);
        });
      });

      it('pressing shift+enter with keywords in the list queries the API with correct query', () => {
        // Despite how this looks-- this actually sets up a "listener" for requests
        // made that fit the options given.
        cy.server();
        cy.route('GET', `/api/v1/messages/?${expectedQueryParams}`).as('filterMessages');
        // hitting shift+enter actually executes the query
        cy.get('[data-cy="keyword_search_input"]').type('{shift}{enter}');
        cy.wait('@filterMessages').should(request => {
          const queryParams = request.url.split('?')[1];
          expect(queryParams).to.eq(expectedQueryParams);
        });
      });
    });

    describe('Processed status filter', () => {
      // grab '[data-cy="processed_status_count"]'
      it('contains the correct status filters, and filters work', () => {
        let unprocessedAmount;
        cy.get('[data-cy="processed_status_widget"]').within(() => {
          cy.contains('All');
          cy.contains('Processed');
          cy.contains('Unprocessed').within(() => {
            cy.get('[data-cy="processed_status_count"]').should($span => {
              // should have text
              const text = $span.text();
              expect(text);

              // text should have a number
              const matches = text.match(/(\d+)/);
              expect(matches);
              unprocessedAmount = matches[0]; //eslint-disable-line
            });
          });
        });

        cy.get('[data-cy="keyword_search_input"]').type('try');
        cy.get('[data-cy="keyword_search_input"]').type('{enter}');
        cy.get('[data-cy="keyword_search_input"]').type('{shift}{enter}');
        cy.wait(500);

        cy.get('[data-cy="processed_status_widget"]').within(() => {
          cy.contains('Unprocessed').within(() => {
            cy.get('[data-cy="processed_status_count"]').should($span => {
              const text = $span.text();
              expect(text);
              const matches = text.match(/(\d+)/);
              expect(matches);
              // eventually, expect this to be less than, but for now not equal is fine.
              expect(matches[0]).equal(unprocessedAmount);
            });
          });
        });
      });
    });

    describe('Email address search', () => {
      const emailSearch = 'EES';
      const expectedCount = '5';
      const expectedFirstSubject = '2001 Special Stock Option Grant Awards';
      before(() => {
        cy.get('[data-cy="keyword_search_input"]').type('{shift}{backspace} {shift}{backspace}');
      });
      it('entering strings in to email address search using hotkey adds to list', () => {
        cy.get('[data-cy="address-search-input"]').type(`${emailSearch} {enter}`);
        cy.get('[data-cy="address-list"]')
          .children()
          .should('have.length', 1);
        cy.get('[data-cy="address-list"]').contains(emailSearch);
      });

      it('returns the expected results', () => {
        cy.applySearch();
        cy.get('[data-cy="search-results__count"]').should($countEl => {
          const count = $countEl.text();
          expect(count).to.eq(expectedCount);
        });
        cy.get('[data-cy="message-list-item__subject"]')
          .first()
          .should($subject => {
            const subject = $subject.text();
            expect(subject).to.include(expectedFirstSubject);
          });
      });

      it('is case insensitive', () => {
        cy.get('[data-cy="address-search-input"]').type('{shift}{backspace} {shift}{backspace}');
        cy.get('[data-cy="address-search-input"]').type(`${emailSearch.toLowerCase()} {enter}`);
        cy.applySearch();
        cy.assertMessageCountEquals(expectedCount);
        cy.get('[data-cy="message-list-item__subject"]')
          .first()
          .should($subject => {
            const subject = $subject.text();
            expect(subject).to.include(expectedFirstSubject);
          });
      });

      it('uses "OR", not "AND"', () => {
        cy.get('[data-cy="address-search-input"]').type('{shift}{backspace} {shift}{backspace}');
        // Search @ENRON.com
        cy.get('[data-cy="address-search-input"]').type('@ENRON.com {enter}');
        cy.applySearch();
        // Should get 4 results
        cy.assertMessageCountEquals('4');

        // Add another term to the search
        cy.get('[data-cy="address-search-input"]').type('ees {enter}');
        cy.applySearch();

        // Adding additional terms to AND filter would lower results.
        // OR should eithe stay the same, or increase. With this test data, it should equal 5.
        cy.assertMessageCountEquals('5');
      });
    });

    describe('Date Range Filter', () => {
      const fromDate = '2001-09-26';
      const toDate = '2001-12-10';
      it('contains the correct from and to dates', () => {
        cy.get('[data-cy="date_range_filter_input"]').within(() => {
          cy.get('[data-cy="date_from_input"]').should($dateInput => {
            expect($dateInput.value === fromDate);
          });

          cy.get('[data-cy="date_to_input"]').should($dateInput => {
            expect($dateInput.value === toDate);
          });
        });
      });

      it('cannot have insane values', () => {
        cy.get('[data-cy="date_range_filter_input"]').within(() => {
          cy.get('[data-cy="date_from_input"]').type('2001-10-04');
          cy.get('[data-cy="date_to_input"]').type('2001-10-03');
          cy.get('[data-cy="date_to_input"]').should($dateInput => {
            expect($dateInput.value === toDate);
          });
        });
        cy.get('[data-cy="date_range_filter_input"]').contains('The "To" date may not ');
        cy.get('[data-cy="date_range_filter_input"]').within(() => {
          cy.get('[data-cy="date_to_input"]').type('2001-12-03');
          cy.get('[data-cy="date_from_input"]').type('2001-12-10');
          cy.get('[data-cy="date_from_input"]').should($dateInput => {
            expect($dateInput.value === fromDate);
          });
        });
        cy.get('[data-cy="date_range_filter_input"]').contains('The "From" date may not');
      });

      it('should show a two message list on Bill Rapp [Sample Data]', () => {
        const dateRange = ['2001-10-01', '2001-10-10'];
        cy.clearKeywords(2);
        cy.enterDateFilters(dateRange);
        cy.applySearch();
        cy.wait(500);
        cy.get('[data-cy="messages-list"]')
          .find('MessageListItem')
          .should($messageList => {
            expect($messageList.length === 2);
          });
      });
    });
  });
});
