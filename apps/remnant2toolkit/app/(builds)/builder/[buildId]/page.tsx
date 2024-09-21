import { type Metadata, type ResolvingMetadata } from 'next';

import { OG_IMAGE_URL, SITE_TITLE } from '@/app/_constants/meta';
import { isErrorResponse } from '@/app/_libs/is-error-response';
import { getBuild } from '@/app/(builds)/_actions/get-build';
import { dbBuildToBuildState } from '@/app/(builds)/_libs/db-build-to-build-state';
import { dbBuildToBuildVariants } from '@/app/(builds)/_libs/db-build-to-build-variants';
import {
  type ArchetypeName,
  getArchetypeComboName,
} from '@/app/(builds)/_libs/get-archetype-combo-name';
import { ViewBuildContainer } from '@/app/(builds)/builder/[buildId]/_components/view-build-container';

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
  const buildVariants = await dbBuildToBuildVariants(build);

  const title = `${build.name} by ${build.createdByDisplayName} ${
    buildVariants.length > 1 ? `(${buildVariants.length} Variants)` : ''
  }`;
  let description = `${buildLabel} Build (${
    archetypes[0] ? archetypes[0] + '/' : ''
  } ${archetypes[1] ? archetypes[1] : ''})`;
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
  const mainBuildResponse = await getBuild(buildId);

  if (isErrorResponse(mainBuildResponse)) {
    console.info(mainBuildResponse.errors);
    return (
      <p className="text-red text-center">
        There was an error loading this build. It may have been removed.
      </p>
    );
  }
  const { build } = mainBuildResponse;
  const buildVariants = await dbBuildToBuildVariants(build);

  return (
    <div className="flex w-full flex-col items-center">
      <div className="height-full flex w-full flex-col items-center justify-center">
        <ViewBuildContainer buildVariants={buildVariants} />
      </div>
    </div>
  );
}
