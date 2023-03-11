/* eslint-disable @typescript-eslint/no-misused-promises */
import { type NextPage } from "next";
import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import { BirdVoteOption } from "~/interfaces/birds";
import { GoArrowLeft, GoArrowRight } from "react-icons/go";

import { api } from "~/utils/api";

export const btn =
  "inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm font-medium rounded-full text-gray-700 bg-white hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500";

const Home: NextPage = () => {
  const [birdOptionOne, birdOptionTwo] = api.useQueries((t) => [
    t.example.birdOptions({ limit: 1, skip: [0] }),
    t.example.birdOptions({ limit: 1, skip: [] })
  ])
    const {
    data: [birdOne] = [],
    isLoading: isOptionOneLoading,
    refetch: refetchOptionOne,
    isFetching: isFetchingOptionOne,
  } = birdOptionOne;
  // const birdOne = optionOne || null

  const {
    data: [birdTwo] = [],
    isLoading: isOptionTwoLoading,
    refetch: refetchOptionTwo,
    isFetching: isFetchingOptionTwo,
  } = birdOptionTwo
  // const birdTwo = optionTwo || null

  const voteUpserttMutation = api.example.upsertVote.useMutation();
  const invalidatePhotosMutation = api.example.invalidateBird.useMutation();







  const handleVote = async ({ id }: { id: number }) => {
    if(isDataLoaded) {
      if (id === birdOne.id) {
          await Promise.all([
            voteUpserttMutation.mutate({
              birdId: birdOne.id,
              voteFor: 1,
              voteAgainst: 0,
            }),
            voteUpserttMutation.mutate({
              birdId: birdTwo.id,
              voteFor: 0,
              voteAgainst: 1,
            }),
          ]);
      } else {
        await Promise.all([
          voteUpserttMutation.mutate({
            birdId: birdOne.id,
            voteFor: 1,
            voteAgainst: 0,
          }),
          voteUpserttMutation.mutate({
            birdId: birdTwo.id,
            voteFor: 0,
            voteAgainst: 1,
          }),
        ]);
      }
    }
    await Promise.all([refetchOptionOne(), refetchOptionTwo()]);
  };

  const handleInvalidPictures = async (id: number) => {
    invalidatePhotosMutation.mutate(id);
    if (isDataLoaded) {
      if (id === birdOne.id) {
        await refetchOptionOne();
      } else {
        await refetchOptionTwo();
      }
    }
  };

      const isDataLoaded =
    !isOptionOneLoading && !isOptionTwoLoading && birdOne && birdTwo;
  const isNextLoading =
    voteUpserttMutation.isLoading && isFetchingOptionOne && isFetchingOptionTwo;



  return (
    <>
      <div className="relative flex h-screen w-screen flex-col items-center justify-center">
        <Head>
          <title>Birbiest Birbs</title>
          <meta name="description" content="Birbiest Birbs" />
          <link rel="icon" href="/favicon.ico" />
        </Head>
        <div className="text-center text-2xl">Which Bird is the most Birb?</div>
        <div className="h-8"></div>
        {(isOptionOneLoading || isOptionTwoLoading) && (
          <img className="w-48" src="hearts.svg"></img>
        )}
        {isDataLoaded && (
          <div className="animate-fade-in flex max-w-3xl flex-col items-center justify-between rounded border p-8 md:flex-row">
            <BirdListing
              bird={birdOne}
              handleVote={handleVote}
              disabled={isNextLoading}
              handleInvalidPictures={handleInvalidPictures}
            />

            <div className="p-8 text-xl italic">{"or"}</div>
            <BirdListing
              bird={birdTwo}
              handleVote={handleVote}
              disabled={isNextLoading}
              handleInvalidPictures={handleInvalidPictures}
            />
          </div>
        )}
        <div className="h-8"></div>
        <Link href="/results" className={btn}>
          See The Results
        </Link>
        <div className="h-8"></div>
        <div className="flex flex-col items-center justify-center">
          <div className="btn btn-primary tooltip">
            What is a Birb?
            <div className="top">
              <p>
                <span className="font-weight-700" style={{ fontWeight: 700 }}>
                  {'"Birb"'}
                </span>
                {
                  " is an internet slang term to refer to birds; usually featuring birds that are exceptionally cute, humorous, and most notably smol."
                }
              </p>
              <i></i>
            </div>
          </div>

          <div className="h-2"></div>
          <div className="btn btn-primary tooltip">
            Where are the images from?
            <div className="top">
              <p>{"The images are sourced from Flickrs api."}</p>
              <br />
              <p>
                {
                  "I'm using the tags on the images and searching by the bird's common name and scientific name fetched from ebird."
                }
              </p>
              <i></i>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Home;

const BirdListing: React.FC<{
  bird: BirdVoteOption;
  handleVote: ({ id }: { id: number }) => Promise<void>;
  disabled: boolean;
  handleInvalidPictures: (id: number) => Promise<void>;
}> = (props) => {
  const { handleVote, handleInvalidPictures, disabled, bird } = props;
  const [showModal, setShowModal] = useState<boolean>(false);

  const [birdImageCounter, setBirdImageCounter] = useState(0);

  useEffect(() => {
    setBirdImageCounter(0);
  }, [bird]);

  return (
    <div className={`flex flex-col items-center `} key={bird.id}>
      <div className="flex h-6 w-72 justify-evenly">
        <div>
          <button
            onClick={() =>
              setBirdImageCounter(
                birdImageCounter - 1 < 0
                  ? bird.photoUrls.length - 1
                  : birdImageCounter - 1
              )
            }
          >
            <GoArrowLeft size={28} />
          </button>
        </div>
        <div>
          {birdImageCounter + 1}/{bird.photoUrls.length}
        </div>
        <div>
          <button
            onClick={() =>
              setBirdImageCounter(
                birdImageCounter + 1 < bird.photoUrls.length
                  ? birdImageCounter + 1
                  : 0
              )
            }
          >
            <GoArrowRight size={28} />
          </button>
        </div>
      </div>
      <div className="h-2"></div>
      <div className="hover-img relative flex h-64 max-h-64 w-64 max-w-[256px] object-contain">
        <Image
          src={bird.photoUrls[birdImageCounter] || ""}
          alt="Invalid Image Please Select next Image"
          width={256}
          height={256}
          style={{ objectFit: "contain" }}
          className="animate-fade-in"
          onClick={() => setShowModal(true)}
          priority={true}
        />
      </div>
      <div className="h-2"></div>
      <div className="mt-[-0.5rem] flex h-16 w-72 justify-center p-1 text-center text-xl capitalize">
        {bird.commonName}
      </div>
      <div className="flex w-72 justify-evenly">
        <button
          onClick={() => handleVote({ id: bird.id })}
          disabled={disabled}
          className={btn}
        >
          Birbier
        </button>
        <div
          className="btn-primary tooltip"
          style={{
            borderBottomStyle: "none",
          }}
        >
          <button
            onClick={() => handleInvalidPictures(bird.id)}
            disabled={disabled}
            className={btn}
          >
            Invalid Images
          </button>
          <div className="top">
            <p>
              {
                "Please click this if the images do not match the bird's name. Clicking this will remove this bird as a choice in the future."
              }
            </p>
            <i></i>
          </div>
        </div>
      </div>
      {showModal ? (
        <>
          <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto overflow-x-hidden outline-none focus:outline-none">
            <div className="relative my-6 mx-auto w-auto max-w-3xl">
              <div>
                <div className="relative flex flex-auto items-center justify-center p-6 ">
                  <div className="p-6">
                    <button
                      onClick={() =>
                        setBirdImageCounter(
                          birdImageCounter - 1 < 0
                            ? bird.photoUrls.length - 1
                            : birdImageCounter - 1
                        )
                      }
                    >
                      <GoArrowLeft size={28} />
                    </button>
                  </div>
                  <div>
                    <div className="relative flex h-[544px] max-h-[544px] w-[576px] max-w-xl object-contain sm:h-[640px] sm:w-[640px] md:h-[768px] md:max-h-[768px] md:max-w-[768px] lg:w-[1200px] lg:max-w-[1200px]">
                      <Image
                        src={bird.photoUrls[birdImageCounter] || ""}
                        alt="Invalid Image Please Select next Image"
                        fill
                        style={{ objectFit: "contain" }}
                        className="animate-fade-in"
                        sizes="(max-width: 768px) 100vw,
              (max-width: 1200px) 50vw,
              33vw"
                      />
                    </div>
                  </div>

                  <div className="p-6">
                    <button
                      onClick={() =>
                        setBirdImageCounter(
                          birdImageCounter + 1 < bird.photoUrls.length
                            ? birdImageCounter + 1
                            : 0
                        )
                      }
                    >
                      <GoArrowRight size={28} />
                    </button>
                  </div>
                </div>

                <div>
                  <div className="flex justify-center p-4 text-xl">
                    {birdImageCounter + 1}/{bird.photoUrls.length}
                  </div>
                  <div className="flex items-center justify-end ">
                    <button
                      className="background-transparent mr-1 mb-1 px-6 py-2 text-sm font-bold uppercase text-red-500 outline-none transition-all duration-150 ease-linear focus:outline-none "
                      type="button"
                      onClick={() => setShowModal(false)}
                    >
                      Close
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="fixed inset-0 z-40 bg-black opacity-50"></div>
        </>
      ) : null}
    </div>
  );
};
