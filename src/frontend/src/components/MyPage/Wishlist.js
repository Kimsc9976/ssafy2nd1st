import React from 'react';
import { styled } from 'styled-components';
import { colors } from '../../assets/colors';
import BoardListItem from './components/BoardListItem';

const Wishlist = ({ list, onClickItem }) => {
  console.log(list);
  return (
    <SLayout>
      <SContainer>
        <STitleBlock>
          <STitle>관심 목록</STitle>
        </STitleBlock>
        <STable>
          <thead>
            <tr>
              <th className="category">분류</th>
              <th className="product">제품</th>
              <th className="title">제목</th>
              <th className="date">작성일</th>
            </tr>
          </thead>
          <tbody>
            {list.length > 0 ? (
              list.map((item) => {
                return (
                  <BoardListItem
                    item={item}
                    key={item.id}
                    onClickItem={onClickItem}
                  />
                );
              })
            ) : (
              <td colSpan={4}>
                <SEmpty>작성한 글이 없습니다.</SEmpty>
              </td>
            )}
          </tbody>
        </STable>
      </SContainer>
    </SLayout>
  );
};

const SLayout = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
`;

const SContainer = styled.div`
  display: flex;
  width: 800px;
  padding: 10px;
  flex-direction: column;
  justify-content: center;
  align-items: center;
`;

const STitleBlock = styled.div`
  display: flex;
  width: 100%;
  padding: 20px;
  align-items: center;
  justify-content: space-between;
`;

const STitle = styled.div`
  color: #000;
  text-align: center;
  font-size: 20px;
  font-weight: 700;
`;

const SCheckBoxBlock = styled.div`
  display: flex;
  align-items: center;
  gap: 30px;
`;

const STable = styled.table`
  width: 100%;
  justify-content: center;
  align-items: center;
  border-spacing: 0px;

  thead {
    width: 100%;

    th {
      color: #000;
      font-size: 16px;
      font-weight: 700;
      border-bottom: 1px solid ${colors.primary};
    }

    th.category,
    th.product {
      padding: 20px;
      width: 120px;
    }
    th.title {
      padding: 20px;
      width: 340px;
    }

    th.date {
      padding: 20px;
      width: 200px;
    }
  }
`;

const SEmpty = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  width: 100%;
  font-size: 16px;
  font-weight: 700;
  color: #d9d9d9;
`;

export default Wishlist;
