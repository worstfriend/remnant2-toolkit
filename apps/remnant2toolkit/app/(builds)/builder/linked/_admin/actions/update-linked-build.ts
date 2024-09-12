'use server';

import { prisma } from '@repo/db';
import { revalidatePath } from 'next/cache';

import { type AdminToolResponse } from '@/app/(builds)/_types/admin-tool-response';
import { MAX_LINKED_BUILD_DESCRIPTION_LENGTH } from '@/app/(builds)/builder/linked/_constants/max-linked-build-description-length';
import { type LinkedBuild } from '@/app/(builds)/builder/linked/_types/linked-build';
import { sendWebhook } from '@/app/(user)/_auth/moderation/send-webhook';
import { getSession } from '@/app/(user)/_auth/services/sessionService';

export async function updateLinkedBuild(
  linkedBuild: LinkedBuild,
): Promise<AdminToolResponse> {
  if (!linkedBuild.id)
    return { status: 'error', message: 'No linked build id provided!' };

  const session = await getSession();
  if (!session || !session.user) {
    return {
      status: 'error',
      message: 'You must be logged in.',
    };
  }

  if (session.user.role !== 'admin') {
    return {
      status: 'error',
      message: 'You must be an admin to update builds.',
    };
  }

  // if the description is longer than allowed, truncate it
  if (
    linkedBuild.description &&
    linkedBuild.description.length > MAX_LINKED_BUILD_DESCRIPTION_LENGTH
  ) {
    linkedBuild.description =
      linkedBuild.description.slice(
        0,
        MAX_LINKED_BUILD_DESCRIPTION_LENGTH - 3,
      ) + '...';
  }

  try {
    // delete all linked build items
    await prisma.linkedBuildItems.deleteMany({
      where: {
        linkedBuildId: linkedBuild.id,
      },
    });

    const build = await prisma.linkedBuild.update({
      where: { id: linkedBuild.id },
      data: {
        name: linkedBuild.name,
        description: linkedBuild.description,
        LinkedBuildItems: {
          create: linkedBuild.linkedBuildItems.map((item) => ({
            createdAt: new Date(),
            label: item.label,
            buildId: item.build.id,
          })),
        },
      },
    });

    // write to the audit log
    await prisma.auditLog.create({
      data: {
        userId: build.createdById,
        moderatorId: session.user.id,
        action: 'UPDATE_LINKED_BUILD',
        details: '',
      },
    });

    // Send to webhook
    sendWebhook({
      webhook: 'auditLog',
      params: {
        embeds: [
          {
            title: `Audit Log Update`,
            color: 0x00ff00,
            fields: [
              {
                name: 'Audit Action',
                value: `UPDATE_LINKED_BUILD`,
              },
              {
                name: 'Moderator',
                value: session.user.displayName,
              },
              {
                name: 'Build Link',
                value: `https://remnant2toolkit.com/builder/linked/${build.id}`,
              },
            ],
          },
        ],
      },
    });

    revalidatePath('/builder/[buildId]', 'page');

    return {
      status: 'success',
      message: 'Build updated.',
    };
  } catch (e) {
    console.error(e);
    return {
      status: 'error',
      message: 'Failed to update build.',
    };
  }
}
