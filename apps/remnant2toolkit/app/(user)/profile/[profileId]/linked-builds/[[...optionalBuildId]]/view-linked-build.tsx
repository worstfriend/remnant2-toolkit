'use client';

import {
  BaseButton,
  BaseLink,
  EditIcon,
  EyeIcon,
  ShareIcon,
  Skeleton,
} from '@repo/ui';
import { urlNoCache } from '@repo/utils';
import copy from 'clipboard-copy';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';

import { Tooltip } from '@/app/_components/tooltip';
import { usePagination } from '@/app/_hooks/use-pagination';
import { BuildList } from '@/app/(builds)/_components/build-list';
import { type LinkedBuildState } from '@/app/(builds)/builder/(deprecated)/linked/[linkedBuildId]/types';
import { getLinkedBuilds } from '@/app/(user)/profile/[profileId]/linked-builds/[[...optionalBuildId]]/get-linked-builds';
import { LinkedBuildCard } from '@/app/(user)/profile/[profileId]/linked-builds/[[...optionalBuildId]]/linked-build-card';

interface Props {
  itemsPerPage?: number;
  isEditable: boolean;
  profileId: string;
  buildId: string | undefined;
}

export function ViewLinkedBuild({
  buildId,
  isEditable,
  itemsPerPage = 8,
  profileId,
}: Props) {
  const router = useRouter();

  const [linkedBuilds, setLinkedBuilds] = useState<LinkedBuildState[]>([]);

  const [totalBuildCount, setTotalBuildCount] = useState(0);
  const [requestedBuildName, setRequestedBuildName] = useState<
    string | undefined
  >(undefined);
  const [isLoading, setIsLoading] = useState(true);

  const {
    currentPage,
    firstVisibleItemNumber,
    lastVisibleItemNumber,
    pageNumbers,
    totalPages,
    handleSpecificPageClick,
    handleNextPageClick,
    handlePreviousPageClick,
  } = usePagination({
    totalItemCount: totalBuildCount,
    itemsPerPage,
  });

  // Fetch data
  useEffect(() => {
    const getItemsAsync = async () => {
      setIsLoading(true);
      const response = await getLinkedBuilds({
        buildId,
        itemsPerPage,
        pageNumber: currentPage,
        userId: profileId,
      });
      setIsLoading(false);
      setTotalBuildCount(response.totalCount);
      setLinkedBuilds(response.linkedBuilds);
      setRequestedBuildName(response.requestedBuildName);
    };
    getItemsAsync();
  }, [
    buildId,
    currentPage,
    itemsPerPage,
    setLinkedBuilds,
    setTotalBuildCount,
    profileId,
  ]);

  function handleCopyBuild(linkedBuildId: string) {
    const url = urlNoCache(
      `${window.location.origin}/builder/linked/${linkedBuildId}`,
    );
    copy(url);
    toast.success('Copied linked build URL to clipboard!');
  }

  if (isLoading) {
    return <Skeleton className="min-h-[1100px] w-full" />;
  }

  return (
    <>
      {requestedBuildName && (
        <div className="border-b border-gray-800 bg-gray-950 px-4 py-4 sm:px-6 lg:px-8">
          <div className="mx-auto flex max-w-7xl items-center justify-between">
            <h1 className="text-2xl font-semibold text-gray-300">
              Linked Builds for{' '}
              <BaseLink
                href={`/builder/${buildId}`}
                className="text-primary-500 hover:underline"
              >
                {requestedBuildName}
              </BaseLink>
            </h1>
            <BaseButton
              color="red"
              onClick={() => router.push(`/profile/${profileId}/linked-builds`)}
            >
              Clear Filter
            </BaseButton>
          </div>
        </div>
      )}
      <BuildList
        currentPage={currentPage}
        isLoading={isLoading}
        isWithQuality={false}
        pageNumbers={pageNumbers}
        totalItems={totalBuildCount}
        totalPages={totalPages}
        firstVisibleItemNumber={firstVisibleItemNumber}
        lastVisibleItemNumber={lastVisibleItemNumber}
        onPreviousPage={handlePreviousPageClick}
        onNextPage={handleNextPageClick}
        onSpecificPage={handleSpecificPageClick}
        headerActions={undefined}
      >
        <ul
          role="list"
          className="my-4 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
        >
          {linkedBuilds.map((linkedBuildState) => (
            <div key={linkedBuildState.id} className="w-full">
              <LinkedBuildCard
                linkedBuildState={linkedBuildState}
                isLoading={false}
                footerActions={
                  <>
                    <div className="flex w-full items-center justify-center gap-6 p-2 text-sm">
                      <Tooltip content="View Build">
                        <BaseButton
                          color="violet"
                          onClick={() =>
                            router.push(
                              `/builder/linked/${linkedBuildState.id}`,
                            )
                          }
                          aria-label="View Linked Build"
                        >
                          <EyeIcon className="h-4 w-4" />
                        </BaseButton>
                      </Tooltip>
                      <Tooltip content="Copy Build URL">
                        <BaseButton
                          color="cyan"
                          aria-label="Copy build URL to clipboard"
                          onClick={() => handleCopyBuild(linkedBuildState.id)}
                        >
                          <ShareIcon className="h-4 w-4" />
                        </BaseButton>
                      </Tooltip>
                      {isEditable && (
                        <>
                          <Tooltip content="Edit Build">
                            <BaseButton
                              color="green"
                              onClick={() =>
                                router.push(
                                  `/builder/linked/edit/${linkedBuildState.id}`,
                                )
                              }
                              aria-label="Edit Linked Build"
                            >
                              <EditIcon className="h-4 w-4" />
                            </BaseButton>
                          </Tooltip>
                        </>
                      )}
                    </div>
                  </>
                }
              />
            </div>
          ))}
        </ul>
      </BuildList>
    </>
  );
}
