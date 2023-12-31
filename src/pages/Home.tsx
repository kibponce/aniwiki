import { useState, useEffect, useRef, ChangeEvent, useCallback } from "react";
import { useQuery } from "@apollo/client";
import styled from "styled-components";
import { size, media } from "../utils/styles";
import Layout from "./layout";
import Input from "../components/Input";
import Card from "../components/Card";
// GraphQL - media service
import { getMediaListQuery, Media, MediaSort } from "../service/media";
import { debounce } from "lodash";

const Home = () => {
  const scrollObserver = useRef(null);
  const [mediaLists, setMediaLists] = useState<Array<Media | null>>([]);
  const { loading, error, data, refetch } = useQuery(getMediaListQuery, {
    variables: {
      search: null,
      page: 1,
      perPage: 20,
      sort: [MediaSort.TrendingDesc, MediaSort.PopularityDesc],
    },
  });

  const handleSearch = debounce((e: ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    // reset the current page to refresh the list
    refetch({
      search: value,
      page: 1,
    });
  }, 500);

  const handleObserver = useCallback(
    (entries: any[]) => {
      const target = entries[0];
      // check if the DOM intersect the viewport
      if (target.isIntersecting) {
        const hasNextPage = data?.Page?.pageInfo?.hasNextPage;
        const currentPage = data?.Page?.pageInfo?.currentPage || 0;
        // check if request is done
        if (!loading && hasNextPage) {
          refetch({
            page: currentPage + 1,
          });
        }
      }
    },
    [loading, data]
  );

  useEffect(() => {
    const observer = new IntersectionObserver(handleObserver, {
      root: null,
      rootMargin: "20px",
      threshold: 0,
    });

    if (scrollObserver.current) observer.observe(scrollObserver.current);

    // disconnect observer when unmount
    return () => observer && observer.disconnect();
  }, [handleObserver]);

  useEffect(() => {
    const mediaCollection = data?.Page?.media || [];
    const currentPage = data?.Page?.pageInfo?.currentPage;

    currentPage === 1
      ? setMediaLists(mediaCollection)
      : setMediaLists((prev) => [...prev, ...mediaCollection]);
  }, [data]);

  return (
    <Layout>
      <SearchContainer>
        <SearchWrapper>
          <Input placeholder="Search Anime" onChange={handleSearch} />
        </SearchWrapper>
      </SearchContainer>
      <ListsContainer>
        <h6>Trending</h6>
        {mediaLists.length > 0 && (
          <CardsContainer>
            {mediaLists.map(
              (item, index) => item && <Card item={item} key={index} />
            )}
          </CardsContainer>
        )}
        {/* TODO: enhance UI */}
        {loading && <p>Loading...</p>}
        {!!error && <p>{error.message}</p>}
      </ListsContainer>
      <div ref={scrollObserver}></div>
    </Layout>
  );
};

const SearchContainer = styled.div`
  background: #ffffff;
  padding: 40px 0;

  ${media.xl`
    padding: 30px 20px;
  `}
`;

const SearchWrapper = styled.div`
  width: ${size.xl};
  margin: 0 auto;

  ${media.xl`
    width: 100%;
  `}
`;

const ListsContainer = styled.div`
  width: ${size.xl};
  margin: 0 auto;
  padding: 40px 0;

  ${media.xl`
    width: 100%;
  `}
`;

const CardsContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(3, minmax(390px, 460px));
  grid-template-rows: repeat(auto-fill, 300px);
  grid-gap: 35px 30px;
  margin-bottom: 10px;
  margin-top: 10px;

  ${media.xl`
    grid-template-columns: repeat(2, minmax(390px, 50%));
    grid-gap: 35px 30px;
    padding: 0 15px;
  `}

  ${media.md`
    grid-template-columns: 100%;
    padding: 0 15px;
  `}
`;

export default Home;
