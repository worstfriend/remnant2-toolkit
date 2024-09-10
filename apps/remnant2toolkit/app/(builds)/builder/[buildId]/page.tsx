import { type Metadata, type ResolvingMetadata } from 'next';

import { OG_IMAGE_URL, SITE_TITLE } from '@/app/_constants/meta';
import { isErrorResponse } from '@/app/_libs/is-error-response';
import { getBuild } from '@/app/(builds)/_actions/get-build';
import { incrementViewCount } from '@/app/(builds)/_actions/increment-view-count';
import { cleanUpBuildState } from '@/app/(builds)/_libs/clean-up-build-state';
import { dbBuildToBuildState } from '@/app/(builds)/_libs/db-build-to-build-state';
import {
  type ArchetypeName,
  getArchetypeComboName,
} from '@/app/(builds)/_libs/get-archetype-combo-name';
import { ViewBuildContainer } from '@/app/(builds)/builder/[buildId]/_components/view-build-container';
import { getLinkedBuild } from '@/app/(builds)/builder/linked/_actions/get-linked-build';
import { getLinkedBuildIds } from '@/app/(builds)/builder/linked/_actions/get-linked-build-ids';
import { type LinkedBuildState } from '@/app/(builds)/builder/linked/_types/linked-build-state';

export async function generateMetadata(
  { params: { buildId } }: { params: { buildId: string } },
  _parent: ResolvingMetadata,
): Promise<Metadata> {
  const buildData = await getBuild(buildId);

  if (isErrorResponse(buildData)) {
    console.info(buildData.errors);
    return {
      title: 'Error loading build',
      description:
        'There was an error loading this build. It may have been removed',
      openGraph: {
        title: 'Error loading build',
        description:
          'There was an error loading this build. It may have been removed',
        url: `https://remnant2toolkit.com/builder/${buildId}`,
        images: [
          {
            url: OG_IMAGE_URL,
            width: 150,
            height: 150,
          },
        ],
        type: 'website',
      },
      twitter: {
        title: 'Error loading build',
        description:
          'There was an error loading this build. It may have been removed',
      },
    };
  }

  const { build } = buildData;

  if (!build.isPublic) {
    return {
      title: 'Private Build',
      description: 'This build is private.',
      openGraph: {
        title: 'Private Build',
        description: 'This build is private.',
        url: `https://remnant2toolkit.com/builder/${build.id}`,
        images: [
          {
            url: OG_IMAGE_URL,
            width: 150,
            height: 150,
          },
        ],
        type: 'website',
      },
      twitter: {
        title: 'Private Build',
        description: 'This build is private.',
      },
    };
  }

  const buildState = dbBuildToBuildState(build);
  const archetypes = buildState.items.archetype.map(
    (a) => a?.name.toLowerCase(),
  );
  const buildLabel = getArchetypeComboName({
    archetype1: (archetypes[0] as ArchetypeName) ?? null,
    archetype2: (archetypes[1] as ArchetypeName) ?? null,
  });

  const title = `${build.name} by ${build.createdByDisplayName}`;
  let description = `${buildLabel} Build`;
  description += `\r\n`;
  description += `\r\n`;
  description +=
    build.description ?? 'A Remnant 2 Build, generated by Remnant 2 Toolkit';

  return {
    title,
    description,
    openGraph: {
      title,
      description: description,
      siteName: SITE_TITLE,
      url: `https://remnant2toolkit.com/builder/${build.id}`,
      images: [
        {
          url: OG_IMAGE_URL,
          width: 150,
          height: 150,
        },
      ],
      type: 'website',
    },
    twitter: {
      title,
      description,
    },
  };
}

export default async function Page({
  params: { buildId },
}: {
  params: { buildId: string };
}) {
  const buildData = await getBuild(buildId);

  if (isErrorResponse(buildData)) {
    console.info(buildData.errors);
    return (
      <p className="text-red text-center">
        There was an error loading this build. It may have been removed.
      </p>
    );
  }
  const { build } = buildData;
  const buildState = cleanUpBuildState(dbBuildToBuildState(build));

  const { linkedBuildIds } = await getLinkedBuildIds(buildId);

  // Need to loop over each id and fetch the linked build
  const linkedBuildData = await Promise.all(
    linkedBuildIds.map((linkedBuildId) => getLinkedBuild(linkedBuildId)),
  );

  for (const linkedBuild of linkedBuildData) {
    // if there is an error, remover item from array
    if (isErrorResponse(linkedBuild) || !linkedBuild.linkedBuildState) {
      linkedBuildData.splice(linkedBuildData.indexOf(linkedBuild), 1);
    }
  }

  const linkedBuildStates = linkedBuildData
    .filter((linkedBuild) => linkedBuild.linkedBuildState)
    .map((linkedBuild) => linkedBuild.linkedBuildState as LinkedBuildState);

  if (!linkedBuildStates) {
    return (
      <p className="text-red text-center">
        There was an error loading this linked build. It may have been removed.
      </p>
    );
  }

  const viewCountResponse = await incrementViewCount({
    buildId: buildState.buildId || '',
  });
  if (viewCountResponse.viewCount !== -1) {
    buildState.viewCount = viewCountResponse.viewCount;
  }

  return (
    <div className="flex w-full flex-col items-center">
      <div className="height-full flex w-full flex-col items-center justify-center">
        <ViewBuildContainer
          buildState={buildState}
          linkedBuildStates={linkedBuildStates}
        />
      </div>
    </div>
  );
}
