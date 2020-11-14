import React, { Component } from 'react'
import ApolloClient, { gql, InMemoryCache } from 'apollo-boost'
import { ApolloProvider, Query } from 'react-apollo'
import {
  Grid,
  Card,
  CardContent,
  Typography,
  LinearProgress,
} from '@material-ui/core'
import './App.css'
import Header from './components/Header'
import Error from './components/Error'
import Nfts from './components/Nfts'
import Filter from './components/Filter'

const client = new ApolloClient({
  uri: "http://localhost:8000/subgraphs/name/once/nft-aggregator",
  cache: new InMemoryCache(),
})

const METRICS_QUERY = gql`
  query count {
    count(id: "all") {
      nftTotal
      nftRariTotal
      nftSuprTotal

      bidTotal
      bidAmountTotal

      saleTotal
      saleRariTotal
      saleSuprTotal
      saleAmountTotal
      saleRariAmountTotal
      saleSuprAmountTotal
    }
  }
`

const NFTS_QUERY = gql`
  query nfts($where: Nft_filter!, $orderBy: Nft_orderBy!) {
    nfts(first: 5, skip:60, where: $where, orderBy: $orderBy, orderDirection: asc) {
      id
      tokenId
      tokenURI
      createdBy
      creator { id }
      name
      imageUri
      salePrice
      currentBid { amount }
      created
    }
  }
`
const SOLD_QUERY = gql`
  query saleLogs {
    saleLogs(first: 5, orderBy: timestamp , orderDirection: desc) {
      id
      amount
      buyer { id }
      seller { id }
      nft {
        id
        tokenId
        tokenURI
        createdBy
        creator { id }
        name
        imageUri
        salePrice
        currentBid { amount }
        created
      }
      token
      timestamp
    }
  }
`
const BID_QUERY = gql`
  query bidLogs {
    bidLogs(first: 5, orderBy: timestamp , orderDirection: desc) {
      id
      amount
      bidder { id }
      nft {
        id
        tokenId
        tokenURI
        createdBy
        creator { id }
        name
        imageUri
        salePrice
        currentBid { amount }
        created
      }
      token
      timestamp
    }
  }
`
const cardStyle = { 
  float: 'left',
  width: '25%',
  margin: '10px',
};

const headlineStyle = { 
  float: 'left',
  width: '100%',
  margin: '10px',
  color: '#fafafa',
  borderBottom: 'solid 1px #0ee565'
};

class App extends Component {
  constructor(props) {
    super(props)
    this.state = {
      Rarible: true,
      SuperRare: true,
      AsyncArt: true,
      orderBy: "created",
    }
  }

  render() {
    const { Rarible, SuperRare, AsyncArt, orderBy } = this.state

    return (
      <ApolloProvider client={client}>
        <div className="App">
          <Grid container direction="column">
            <Header />
            <Filter
              orderBy={orderBy}
              Rari={Rarible}
              Supr={SuperRare}
              Async={AsyncArt}
              onToggleRari={() =>
                this.setState(state => ({ ...state, Rarible: !state.Rarible }))
              }
              onToggleSupr={() =>
                this.setState(state => ({ ...state, SuperRare: !state.SuperRare }))
              }
              onToggleAsync={() =>
                this.setState(state => ({ ...state, AsyncArt: !state.AsyncArt }))
              }
            />
            <Grid><br/><br/></Grid>
            <Grid container direction="column" spacing={16}>
                <Query query={METRICS_QUERY} >
                  {({ data, error, loading }) => {
                    return loading ? (
                      <LinearProgress variant="query" style={{ width: '100%' }} />
                    ) : error ? (
                      <Error error={error} />
                    ) : (
                      <Grid container direction="column" spacing={16}>
                        <Grid>
                        <Card style={cardStyle}>
                          <CardContent>
                            <Typography color="textSecondary" gutterBottom>
                              Total NFTs
                            </Typography>
                            <Typography component="h2" variant="h2">
                              {data.count.nftTotal}
                            </Typography>
                          </CardContent>
                        </Card>
                        <Card style={cardStyle}>
                          <CardContent>
                            <Typography color="textSecondary" gutterBottom>
                              Total Sold
                            </Typography>
                            <Typography component="h2" variant="h2">
                              {data.count.saleTotal}
                            </Typography>
                          </CardContent>
                        </Card>
                        <Card style={cardStyle}>
                          <CardContent>
                            <Typography color="textSecondary" gutterBottom>
                              Total Value
                            </Typography>
                            <Typography component="h2" variant="h2">
                              ${Math.round(470 * data.count.saleAmountTotal / 1000000000000000000)} 
                            </Typography>
                          </CardContent>
                        </Card>
                        </Grid>
                      </Grid>
                    )
                  }}
                </Query>
            </Grid>
            <Grid><br/><br/></Grid>
            <Grid container direction="column" spacing={16}>
                <Query
                  query={NFTS_QUERY}
                  variables={{
                    where: {
                      ...(Rarible ? { symbol: "RARI" } : { }),
                      ...(SuperRare ? { symbol: "SUPR" } : { }),
                    },
                    orderBy: orderBy,
                  }}
                >
                  {({ data, error, loading }) => {
                    return loading ? (
                      <LinearProgress variant="query" style={{ width: '100%' }} />
                    ) : error ? (
                      <Error error={error} />
                    ) : (
                      <Grid container direction="column" spacing={16}>
                          <Typography variant="h4" style={headlineStyle}>
                            Latest Minted Nfts
                          </Typography>
                          <Nfts nfts={data.nfts} />                        
                      </Grid>
                    )
                  }}
                </Query>
            </Grid>
            <Grid><br/><br/><br/></Grid>
            <Grid container direction="column" spacing={16}>
                <Query
                  query={SOLD_QUERY}
                  variables={{
                    orderBy: orderBy,
                  }}
                >
                  {({ data, error, loading }) => {
                    return loading ? (
                      <LinearProgress variant="query" style={{ width: '100%' }} />
                    ) : error ? (
                      <Error error={error} />
                    ) : (
                      <Grid container direction="column" spacing={16}>
                          <Typography variant="h4" style={headlineStyle}>
                            Latest Sold Nfts
                          </Typography>
                        <Nfts nfts={data.saleLogs} />
                      </Grid>
                    )
                  }}
                </Query>
            </Grid>
            <Grid><br/><br/><br/></Grid>
            <Grid container direction="column" spacing={16}>
                <Query
                  query={BID_QUERY}
                  variables={{
                    orderBy: orderBy,
                  }}
                >
                  {({ data, error, loading }) => {
                    return loading ? (
                      <LinearProgress variant="query" style={{ width: '100%' }} />
                    ) : error ? (
                      <Error error={error} />
                    ) : (
                      <Grid container direction="column" spacing={16}>
                          <Typography variant="h4" style={headlineStyle}>
                            Latest Bids
                          </Typography>
                        <Nfts nfts={data.bidLogs} />
                      </Grid>
                    )
                  }}
                </Query>
            </Grid>
          </Grid>
        </div>
      </ApolloProvider>
    )
  }
}

export default App
